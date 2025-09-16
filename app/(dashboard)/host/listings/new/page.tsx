import { NewListingForm } from "@/app/_components/listings/NewListingForm";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create a new listing</h1>
        <p className="text-sm text-gray-500">Add essential details to draft your stay. You can upload photos and publish after saving.</p>
      </div>
      <NewListingForm />
    </div>
  );
}
