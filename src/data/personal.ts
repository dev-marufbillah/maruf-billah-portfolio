import type { Person } from "@/types";

/**
 * EDIT HERE — Personal and contact information.
 * `null` values are intentionally rendered as visible, disabled placeholders.
 * Replace them only with information you want to publish.
 */
export const personal: Person = {
  name: "Maruf Billah",
  brand: "MARUF.B",
  designation: "Web Developer",
  roles: ["Web Developer", "Frontend Developer", "Creative Developer", "Full-Stack Developer"],
  location: "Bangladesh",
  heroDescription:
    "I build modern, responsive, and interactive digital experiences with a passion for clean design, innovative technology, and functional web applications.",
  shortTagline: "Modern, responsive, and interactive digital experiences.",
  profileImage: "/images/maruf-billah.webp",
  profileAlt:
    "Professional portrait of Maruf Billah wearing round glasses and a white shirt, standing with arms folded against a gray background.",
  resume: {
    path: "/resume.pdf",
    fileName: "Maruf-Billah-Resume.pdf",
    downloadLabel: "Download My Resume",
    editPath: "public/resume.pdf",
    missingMessage:
      "No resume PDF has been added yet. Place your real PDF at public/resume.pdf; the download and preview will activate automatically after a rebuild.",
  },
  contact: [
    {
      id: "email",
      label: "Email address",
      value: null,
      placeholder: "ADD YOUR EMAIL",
      editPath: "src/data/personal.ts → contact.email",
      kind: "email",
    },
    {
      id: "phone",
      label: "Phone number",
      value: null,
      placeholder: "ADD YOUR PHONE",
      editPath: "src/data/personal.ts → contact.phone",
      kind: "phone",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      value: null,
      placeholder: "ADD YOUR WHATSAPP",
      editPath: "src/data/personal.ts → contact.whatsapp",
      kind: "whatsapp",
    },
  ],
  about: {
    heading: "More Than Just Code.",
    subheading: "A little more about the person behind the work.",
    verifiedIntro:
      "I build modern, responsive, and interactive digital experiences with a passion for clean design, innovative technology, and functional web applications.",
    verifiedFacts: [
      { label: "Location", value: "Bangladesh" },
      { label: "Focus", value: "Web Development" },
      { label: "Language", value: "English" },
    ],
    fields: [
      {
        id: "who-i-am",
        question: "Who I am",
        answer: "EDIT: Add a short, first-person introduction in your own words.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[0]",
      },
      {
        id: "programming-journey",
        question: "Programming journey",
        answer: "EDIT: Describe your real programming journey, including when and how you started.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[1]",
      },
      {
        id: "web-interest",
        question: "Interest in web development",
        answer: "EDIT: Explain what genuinely drew you to web development.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[2]",
      },
      {
        id: "technologies",
        question: "Technologies I enjoy",
        answer: "EDIT: List the technologies you have actually studied or used and enjoy working with.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[3]",
      },
      {
        id: "products",
        question: "Products I like building",
        answer: "EDIT: Describe the kinds of digital products you want to build.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[4]",
      },
      {
        id: "problem-solving",
        question: "Problem-solving approach",
        answer: "EDIT: Describe your real approach to understanding and solving technical problems.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[5]",
      },
      {
        id: "hobbies",
        question: "Outside programming",
        answer: "EDIT: Add your verified hobbies and interests outside programming.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[6]",
      },
      {
        id: "future-goals",
        question: "Future goals",
        answer: "EDIT: Share your actual short-term and long-term goals.",
        isPlaceholder: true,
        editPath: "src/data/personal.ts → about.fields[7]",
      },
    ],
  },
};
