<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['customer', 'items.product'])
            ->latest()
            ->paginate(10)
            ->through(fn($invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'customer' => [
                    'id' => $invoice->customer?->id,
                    'name' => $invoice->customer?->name,
                ],
                'subtotal' => $invoice->subtotal,
                'discount' => $invoice->discount,
                'tax' => $invoice->tax,
                'total' => $invoice->total,
                'status' => $invoice->status,
                'created_at' => $invoice->created_at,
            ]);

        if (request()->wantsJson()) {
            return response()->json(['invoices' => $invoices]);
        }

        return Inertia::render('invoices/Index', [
            'invoices' => $invoices,
        ]);
    }

    public function store(StoreInvoiceRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            $invoice = Invoice::create([
                'customer_id'    => $data['customer_id'],
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'invoice_date'   => $data['invoice_date'] ?? now(),
                'subtotal'       => $data['subtotal'],
                'discount'       => $data['discount'] ?? 0,
                'tax'            => $data['tax'] ?? 0,
                'total'          => $data['total'],
                'status'         => $data['status'] ?? 'unpaid',
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $product->decrement('quantity', $item['quantity']);

                $invoice->items()->attach($product->id, [
                    'quantity' => $item['quantity'],
                    'price'    => $item['price'],
                    'total'    => $item['total'],
                ]);
            }

            DB::commit();

            return back()->with([
                'status' => true,
                'message' => 'Invoice created successfully'
            ], JsonResponse::HTTP_CREATED);
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'items.product']);

        return response()->json([
            'status' => true,
            'invoice' => $invoice,
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            $invoice->update([
                'subtotal' => $data['subtotal'],
                'discount' => $data['discount'] ?? 0,
                'tax'      => $data['tax'] ?? 0,
                'total'    => $data['total'],
                'status'   => $data['status'] ?? $invoice->status,
            ]);

            $invoice->items()->detach();
            foreach ($data['items'] as $item) {
                $invoice->items()->attach($item['product_id'], [
                    'quantity' => $item['quantity'],
                    'price'    => $item['price'],
                    'total'    => $item['total'],
                ]);
            }

            DB::commit();

            return back()->with([
                'status' => true,
                'message' => 'Invoice updated successfully'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }

    public function destroy(Invoice $invoice)
    {
        try {
            $invoice->delete();

            return back()->with([
                'status' => true,
                'message' => 'Invoice deleted successfully'
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }
}
