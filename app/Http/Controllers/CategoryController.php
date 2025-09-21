<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::latest()
            ->paginate(10)->through(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ]);

        return Inertia::render('categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function list()
    {
        $categories = Category::latest()
            ->get()
            ->map(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ]);

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        try {
            $data = $request->validated();

            $category = Category::create($data);

            // return to_route('users.index');

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Category added successfully',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        try {
            $data = $request->validated();

            $category->update($data);
            $category->refresh();
            // return to_route('users.index');

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Category added successfully',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        try {
            $category->delete();

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }
}
