<?php

namespace App\Actions\User;

use App\DTO\User\UserData;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    public function execute(UserData $data): User
    {
        $user = User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password),
            'is_super_admin' => $data->is_super_admin ?? false,
        ]);

        return $user;
    }
}

