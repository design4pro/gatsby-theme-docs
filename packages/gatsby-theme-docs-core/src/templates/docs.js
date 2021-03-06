import { graphql } from 'gatsby';
import Docs from '../components/docs';

export default Docs;

export const docsQuery = graphql`
    query DocsQuery($id: String!) {
        site {
            pathPrefix
            siteMetadata {
                title
                docsLocation
                siteUrl
            }
        }
        mdx(fields: { id: { eq: $id } }) {
            fields {
                id
                slug
                title
            }
            body
            tableOfContents
            parent {
                ... on File {
                    relativePath
                }
            }
            frontmatter {
                metaTitle
                metaDescription
            }
            headings {
                depth
                value
            }
        }
        allMdx {
            edges {
                node {
                    fields {
                        slug
                        title
                    }
                }
            }
        }
    }
`;
