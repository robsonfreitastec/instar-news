<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('uuid');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId, 'uuid')],
            'password' => ['sometimes', 'string', 'min:8'],
            'is_super_admin' => ['sometimes', 'boolean'],
            'tenant_uuid' => ['sometimes', 'string', 'exists:tenants,uuid'],
            'role' => ['sometimes', 'string', 'in:admin,editor'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.max' => 'Name must not exceed 255 characters',
            'email.email' => 'Email must be a valid email address',
            'email.unique' => 'This email is already registered',
            'password.min' => 'Password must be at least 8 characters',
        ];
    }
}
