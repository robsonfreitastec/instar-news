<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'domain' => ['sometimes', 'string', 'max:255', 'unique:tenants,domain,'.$this->route('uuid').',uuid'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Name must be a string',
            'name.max' => 'Name must not exceed 255 characters',
            'domain.string' => 'Domain must be a string',
            'domain.max' => 'Domain must not exceed 255 characters',
            'domain.unique' => 'Domain already exists',
        ];
    }
}

