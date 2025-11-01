import {
  JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";

export const jsxConverters: JSXConvertersFunction = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    ...defaultConverters.blocks,
  },
  // Heading converter
  heading: async ({ node, nodesToJSX }) => {
    const Tag = node.tag;
    const children = await nodesToJSX({ nodes: node.children });

    const headingClasses = {
      h1: "text-3xl font-bold mt-6 mb-4",
      h2: "text-2xl font-bold mt-5 mb-3",
      h3: "text-xl font-semibold mt-4 mb-2",
      h4: "text-lg font-semibold mt-3 mb-2",
      h5: "text-base font-semibold mt-2 mb-1",
      h6: "text-sm font-semibold mt-2 mb-1",
    };

    return <Tag className={headingClasses[Tag]}>{children}</Tag>;
  },
  // Link converter
  link: async ({ node, nodesToJSX }) => {
    const children = await nodesToJSX({ nodes: node.children });
    const rel = node.fields.newTab ? "noopener noreferrer" : undefined;
    const target = node.fields.newTab ? "_blank" : undefined;

    return (
      <a
        href={node.fields.url}
        rel={rel}
        target={target}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    );
  },
  // List converter (ul/ol) - now handles check lists
  list: async ({ node, nodesToJSX }) => {
    const children = await nodesToJSX({ nodes: node.children });

    // Check list
    if (node.listType === "check") {
      return <ul className="my-4 space-y-2 ml-4">{children}</ul>;
    }

    // Bullet list
    if (node.listType === "bullet") {
      return (
        <ul className="list-disc list-inside my-4 space-y-2 ml-4">
          {children}
        </ul>
      );
    }

    // Ordered list
    return (
      <ol className="list-decimal list-inside my-4 space-y-2 ml-4">
        {children}
      </ol>
    );
  },
  // List item converter - now handles check list items
  listitem: async ({ node, nodesToJSX }) => {
    const children = await nodesToJSX({ nodes: node.children });

    // Handle check list items
    if (node.checked !== undefined) {
      return (
        <li className="flex items-start gap-2 ml-4">
          <input
            type="checkbox"
            checked={node.checked}
            className="mt-1 cursor-default"
          />
          <span className={node.checked ? "line-through text-black" : ""}>
            {children}
          </span>
        </li>
      );
    }

    // Regular list items
    return <li className="ml-4">{children}</li>;
  },
  // Quote converter
  quote: async ({ node, nodesToJSX }) => {
    const children = await nodesToJSX({ nodes: node.children });

    return (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700">
        {children}
      </blockquote>
    );
  },
  // Paragraph converter
  paragraph: async ({ node, nodesToJSX }) => {
    const children = await nodesToJSX({ nodes: node.children });

    return <p className="my-3 leading-relaxed">{children}</p>;
  },
});
