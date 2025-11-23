import ProductDetailsClient from "./ProductDetailsClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
    return <ProductDetailsClient productId={params.id} />;
}
