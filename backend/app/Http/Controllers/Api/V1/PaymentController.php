<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function pay(Request $request, string $number): JsonResponse
    {
        $data = $request->validate([
            'card_number' => ['required', 'string'],
            'card_name'   => ['required', 'string', 'max:200'],
            'expiry'      => ['required', 'string'],
            'cvv'         => ['required', 'string'],
        ], [
            'card_number.required' => 'Le numéro de carte est obligatoire.',
            'card_name.required'   => 'Le nom sur la carte est obligatoire.',
            'expiry.required'      => 'La date d\'expiration est obligatoire.',
            'cvv.required'         => 'Le CVV est obligatoire.',
        ]);

        $order = Order::where('number', $number)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        try {
            $transaction = $this->paymentService->process($order, $data);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'message'     => $transaction->status === 'accepted'
                ? 'Paiement accepté. Commande reçue.'
                : 'Paiement refusé. Veuillez réessayer.',
            'transaction' => new TransactionResource($transaction),
        ]);
    }
}
