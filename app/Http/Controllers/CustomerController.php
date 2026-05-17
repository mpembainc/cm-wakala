<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Requests\IndexCustomerRequest;
use App\Http\Requests\PostCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\PampersCreditRepaymentResource;
use App\Http\Resources\PampersSaleResource;
use App\Models\Customer;
use App\Models\PampersCreditRepayment;
use App\Models\PampersSale;
use Exception;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    public function index(IndexCustomerRequest $request)
    {
        $validated = $request->validated();

        $perPage = (int) ($validated['per_page'] ?? 15);
        $search = isset($validated['search']) ? trim((string) $validated['search']) : null;

        $query = Customer::query()->with('createdBy');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('tin_number', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $customers = $query
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return CustomerResource::collection($customers);
    }

    public function store(PostCustomerRequest $request)
    {
        return new CustomerResource(Customer::create($request->validated()));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return new CustomerResource($customer);
    }

    public function toggleActive(Customer $customer)
    {
        try {
            $customer->active = !$customer->active;
            $customer->save();

            return ApiResponse::success(new CustomerResource($customer));
        } catch (Exception $exception) {
            Log::error($exception->getMessage());
            return ApiResponse::error(500, 'Failed to toggle customer active status.');
        }
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return response()->json();
    }

    public function show(Customer $customer)
    {
        $this->authorizeJson('show_pampers_customer');

        $customer->load('createdBy');

        $creditSales = PampersSale::with(['customer', 'user'])
            ->where('sale_type', 'CREDIT')
            ->where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->get();

        $repayments = PampersCreditRepayment::query()
            ->with(['user'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('repayment_date')
            ->orderByDesc('id')
            ->get();

        $totalCreditSales = (float) $creditSales->sum('total_amount');
        $totalRepayments = (float) $repayments->sum('amount');
        $balance = $totalCreditSales - $totalRepayments;

        return ApiResponse::success([
            'customer' => new CustomerResource($customer),
            'creditSales' => PampersSaleResource::collection($creditSales),
            'repayments' => PampersCreditRepaymentResource::collection($repayments),
            'totals' => [
                'creditSalesAmount' => $totalCreditSales,
                'repaymentsAmount' => $totalRepayments,
                'balance' => $balance,
            ],
        ]);
    }

    public function creditSales(Customer $customer)
    {
        $this->authorizeJson('list_pampers_sales');

        $sales = PampersSale::with(['customer', 'user'])
            ->where('sale_type', 'CREDIT')
            ->where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(PampersSaleResource::collection($sales));
    }
}
