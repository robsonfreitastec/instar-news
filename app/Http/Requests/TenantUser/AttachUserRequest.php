<?php

namespace App\Http\Requests\TenantUser;

use Illuminate\Foundation\Http\FormRequest;

class AttachUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_uuid' => ['required', 'string', 'uuid', 'exists:users,uuid'],
            'role' => ['required', 'string', 'in:admin,editor'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_uuid.required' => 'User UUID is required',
            'user_uuid.uuid' => 'Invalid UUID format',
            'user_uuid.exists' => 'User not found',
            'role.required' => 'Role is required',
            'role.in' => 'Role must be either admin or editor',
        ];
    }
}

