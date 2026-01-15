<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'avatar' => $this->avatar,
            'name' => $this->name,
            'email' => $this->email,
            'gender' => $this->gender,
            'status' => $this->status, // boolean: true = active, false = inactive
            'role' => $this->role ? [
                'id' => $this->role->id,
                'name' => $this->role->name,
            ] : null,
            'stores' => $this->whenLoaded('stores', function () {
                return $this->stores->map(fn($store) => [
                    'id' => $store->id,
                    'name' => $store->name,
                ]);
            }),
            'email_verified_at' => $this->email_verified_at?->toDateTimeString(),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
