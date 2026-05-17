<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'view_dashboard',

            // cash
            'view_cash_transactions',
            'add_cash_transaction',
            'show_cash_balance',

            // commissions
            'view_commissions',
            'add_commission',

            // expenses
            'view_expenses',
            'add_expense',

            // networks
            'list_networks',
            'add_network',
            'show_network',
            'update_network',
            'delete_network',

            // reports
            'show_user_transactions_report',
            'show_financial_position_report',
            'show_transactions_report',
            'show_commission_report',

            // shop transactions
            'list_shop_transactions',
            'add_shop_transaction',

            // summary
            'show_summary',
            'show_transaction_summary',

            // transactions
            'list_transactions',
            'add_transaction',
            'show_transaction',
            'update_transaction',
            'delete_transaction',

            // users
            'list_users',
            'add_user',
            'show_user',
            'update_user',
            'delete_user',

            // permissions & role
            'list_permissions',
            'list_roles',
            'add_role',
            'assign_permissions_to_role',
            'update_role',
            'delete_role',

            // debtors
            'list_debtors',
            'add_debtor',
            'view_debtor',
            'update_debtor',
            'delete_debtor',

            // loan transactions
            'list_loan_transactions',
            'view_debtor_loan_transactions',
            'add_loan_transaction',
            'view_loan_transaction',
            'update_loan_transaction',
            'delete_loan_transaction',
            'authorize_loan_transaction',
            'view_loan_summary',

            // loan repayments
            'list_loan_repayments',
            'add_loan_repayment',
            'view_loan_repayment',
            'update_loan_repayment',
            'delete_loan_repayment',

            // pampers purchases
            'list_pampers_purchases',
            'add_pampers_purchase',
            'show_pampers_purchase',
            'update_pampers_purchase',
            'delete_pampers_purchase',

            // pampers sales
            'list_pampers_sales',
            'add_pampers_sale',
            'show_pampers_sale',
            'update_pampers_sale',
            'delete_pampers_sale',

            // pampers reports
            'show_pampers_inventory_report',
            'show_pampers_monthly_report',
            'show_pampers_flow_report',
            'show_pampers_sale_by_user_report',

            'list_pampers_customers',
            'add_pampers_customer',
            'show_pampers_customer',
            'update_pampers_customer',
            'delete_pampers_customer',

            'reset_password'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
