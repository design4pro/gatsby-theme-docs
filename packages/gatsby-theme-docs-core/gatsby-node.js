const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Debug = require('debug');
const { createFilePath } = require(`gatsby-source-filesystem`);

const debug = Debug('gatsby-theme-docs');
const withDefaults = require('./default-options');
const getVersionBasePath = require('./src/utils');

function getVersionEdges(edges, version) {
    return edges.filter(edge => {
        const {
            node: { fields }
        } = edge;

        return fields.version === version && !fields.hideInSidebar;
    });
}

// Ensure that content directories exist at site-level
exports.onPreBootstrap = ({ store }, themeOptions) => {
    const { program } = store.getState();
    const { contentPath, assetPath } = withDefaults(themeOptions);

    const dirs = [
        path.join(program.directory, contentPath),
        path.join(program.directory, assetPath)
    ];

    dirs.forEach(dir => {
        debug(`Initializing ${dir} directory`);

        if (!fs.existsSync(dir)) {
            mkdirp.sync(dir);
        }
    });
};

// Create fields for post slugs and source
// This will change with schema customization with work
exports.onCreateNode = ({ node, actions, getNode }, themeOptions) => {
    const { createNodeField } = actions;
    const { localVersion, defaultVersion, contentPath } = withDefaults(
        themeOptions
    );

    if (node.internal.type === `Mdx`) {
        const parent = getNode(node.parent);
        let slug = createFilePath({ node, getNode });
        let version = localVersion || defaultVersion;

        if (parent.gitRemote___NODE) {
            const gitRemote = getNode(parent.gitRemote___NODE);
            version = gitRemote.sourceInstanceName;
            slug = slug.replace(`/^\/${contentPath}/`, '');
        }

        if (version !== defaultVersion) {
            slug = getVersionBasePath(version) + slug;
        }

        createNodeField({
            name: 'version',
            node,
            value: version
        });

        createNodeField({
            name: 'slug',
            node,
            value: slug
        });

        createNodeField({
            name: 'id',
            node,
            value: node.id
        });

        createNodeField({
            name: 'title',
            node,
            value: node.frontmatter.title
        });

        createNodeField({
            name: 'sidebarTitle',
            node,
            value: node.frontmatter.sidebarTitle || ''
        });
    }
};

// These templates are simply data-fetching wrappers that import components
const DocsTemplate = require.resolve(`./src/templates/docs`);

exports.createPages = async ({ graphql, actions, reporter }, themeOptions) => {
    const { createPage } = actions;
    const { localVersion, defaultVersion, versions } = withDefaults(
        themeOptions
    );

    const { data, errors } = await graphql(`
        {
            allMdx {
                edges {
                    node {
                        id
                        internal {
                            type
                        }
                        frontmatter {
                            title
                            navPosition
                            sidebarTitle
                        }
                        fields {
                            slug
                            version
                            title
                        }
                        tableOfContents
                    }
                }
            }
        }
    `);

    if (errors) {
        reporter.panic(errors);
    }

    const { edges } = data.allMdx;

    const mainVersion = localVersion || defaultVersion;
    const versionEdges = {
        [mainVersion]: getVersionEdges(edges, mainVersion)
    };

    const versionKeys = [localVersion].filter(Boolean);
    for (const version in versions) {
        if (version !== defaultVersion) {
            versionKeys.push(version);
        }

        versionEdges[version] = getVersionEdges(edges, version);
    }

    let defaultVersionNumber = null;
    try {
        defaultVersionNumber = parseFloat(defaultVersion, 10);
    } catch (error) {
        // let it slide
    }

    // Create a page for each Doc page
    edges.forEach(({ node }, index) => {
        const previous = index === edges.length - 1 ? null : edges[index + 1];
        const next = index === 0 ? null : edges[index - 1];

        let versionDifference = 0;
        if (defaultVersionNumber) {
            try {
                const versionNumber = parseFloat(fields.version, 10);
                versionDifference = versionNumber - defaultVersionNumber;
            } catch (error) {
                // do nothing
            }
        }

        createPage({
            path: node.fields.slug ? node.fields.slug : '/',
            component: DocsTemplate,
            context: {
                ...node,
                versionDifference,
                versionEdges: versionEdges[node.fields.version],
                versions: versionKeys, // only need to send version labels to client
                defaultVersion,
                layout: `index`,
                previous,
                next
            }
        });
    });
};

// Webpack feature for aliasing in your import statements, just import this plugin
// and all of your folders inside your src will be available with aliases.
//
// ```js
// import "styles/layout.css"
// import Header from "components/Header"
// ```
//
// Instead of
//
// ```js
// import "../../styles/layout.css"
// import Header from "../components/Header/index.js"
// ```
exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
        resolve: {
            modules: [path.resolve(__dirname, 'src'), 'node_modules']
        }
    });
};
