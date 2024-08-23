import { type MetadataRoute } from "next";
import { publicUrl } from "@/env.mjs";

const Categories = [
	{ name: "Apparel", slug: "apparel" },
	{ name: "Accessories", slug: "accessories" },
];

type Item = MetadataRoute.Sitemap[number];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function fetchProducts() {
	const products = await stripe.products.list();
	return products.data;
  }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    if (!publicUrl) {
      throw new Error("publicUrl is not defined");
    }

//    let products;

    try {
      products = await fetchProducts();
    } catch (error) {
      console.error("Error fetching products:", error);
      products = []; // Fallback to empty array if product fetch fails
    }

    const productUrls = products.map((product) => ({
      url: `${publicUrl}/product/${product.metadata.slug}`,
      lastModified: new Date(product.updated * 1000),
      changeFrequency: "daily",
      priority: 0.8,
    } as Item));

    const categoryUrls = Categories.map((category) => ({
      url: `${publicUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    } as Item));

    return [
      {
        url: publicUrl,
        lastModified: new Date(),
        changeFrequency: "always",
        priority: 1,
      },
      ...productUrls,
      ...categoryUrls,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return a minimal sitemap in case of error
    return [
      {
        url: publicUrl || 'https://your-fallback-url.com',
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
