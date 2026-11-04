import type { Metadata } from "next";
import { ProjectDetails } from "@/components/projects/ProjectDetails";
import { projects } from "@/data/projects";
import { absoluteUrl } from "@/data/site";
import { getProjectBySlug } from "@/lib/utils";
import { projectBreadcrumbJsonLd, projectJsonLd } from "@/lib/seo";

export const dynamicParams = true;

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project" };

  const description = `${project.description} Project concept and editable detail dossier.`;
  return {
    title: project.name,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.name} — Maruf Billah`,
      description,
      url: absoluteUrl(`/projects/${project.slug}`),
      images: [{ url: absoluteUrl(project.coverImage), width: 1600, height: 1000, alt: project.coverAlt }],
    },
    twitter: { card: "summary_large_image", title: `${project.name} — Maruf Billah`, description, images: [absoluteUrl(project.coverImage)] },
  };
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const staticProject = getProjectBySlug(slug);

  return (
    <>
      {staticProject && <JsonLd data={projectJsonLd(staticProject)} />}
      {staticProject && <JsonLd data={projectBreadcrumbJsonLd(staticProject)} />}
      <ProjectDetails slug={slug} />
    </>
  );
}
