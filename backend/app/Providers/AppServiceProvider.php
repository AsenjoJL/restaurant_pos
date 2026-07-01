<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute($request->user() ? 240 : 60)->by(
                $request->user()?->getAuthIdentifier() ?: $request->ip()
            );
        });

        Gate::define('admin-only', fn (User $user) => $user->hasRole('admin'));
        Gate::define('manager-access', fn (User $user) => $user->hasAnyRole(['admin', 'manager']));
        Gate::define('cashier-access', fn (User $user) => $user->hasAnyRole(['admin', 'manager', 'cashier', 'kitchen']));
        Gate::define('view-reports', fn (User $user) => $user->hasAnyRole(['admin', 'manager']));
        Gate::define('manage-settings', fn (User $user) => $user->hasRole('admin'));
        Gate::define('manage-users', fn (User $user) => $user->hasRole('admin'));
        Gate::define('view-orders', fn (User $user) => $user->hasAnyRole(['admin', 'manager', 'cashier', 'kitchen']));
        Gate::define('manage-orders', fn (User $user) => $user->hasAnyRole(['admin', 'manager', 'cashier']));
        Gate::define('update-kitchen-orders', fn (User $user) => $user->hasAnyRole(['admin', 'manager', 'kitchen']));
        Gate::define('manage-purchase-orders', fn (User $user) => $user->hasAnyRole(['admin', 'manager']));
        Gate::define('view-order', fn (User $user, Order $order) => $user->hasAnyRole(['admin', 'manager', 'cashier', 'kitchen']));
    }
}
