const withDefaults = require(`./default-options`);

module.exports = themeOptions => {
    const options = withDefaults(themeOptions);

    const gatsbyRemarkPlugins = [
        {
            resolve: `gatsby-remark-images`,
            options: {
                // should this be configurable by the end-user?
                maxWidth: 1380,
                linkImagesToOriginal: false
            }
        },
        { resolve: `gatsby-remark-copy-linked-files` },
        { resolve: `gatsby-remark-smartypants` }
    ];

    return {
        siteMetadata: {
            title: `Documentation Title Placeholder`,
            author: `Name Placeholder`,
            description: `Description placeholder`,
            social: [
                {
                    name: `Twitter`,
                    url: `https://twitter.com/design4pro`
                },
                {
                    name: `GitHub`,
                    url: `https://github.com/design4pro`
                }
            ]
        },
        plugins: [
            {
                resolve: `gatsby-source-filesystem`,
                options: {
                    path: options.contentPath || `content`,
                    name: options.contentPath || `content`
                }
            },
            {
                resolve: `gatsby-source-filesystem`,
                options: {
                    path: options.assetPath || `static/assets`,
                    name: options.assetPath || `static/assets`
                }
            },
            {
                resolve: 'gatsby-transformer-remark',
                options: {
                    plugins: gatsbyRemarkPlugins
                }
            },
            {
                resolve: `gatsby-plugin-mdx`,
                options: {
                    extensions: [`.mdx`, `.md`],
                    gatsbyRemarkPlugins: gatsbyRemarkPlugins,
                    remarkPlugins: [require(`remark-slug`)]
                }
            },
            `gatsby-plugin-react-helmet`,
            `gatsby-transformer-sharp`,
            `gatsby-plugin-sharp`,
            {
                resolve: `gatsby-plugin-manifest`,
                options: {
                    name: `Gatsby Documentation Starter`,
                    short_name: `GatsbyDocumentation`,
                    start_url: `/`,
                    background_color: `#ffffff`,
                    theme_color: `#663399`,
                    display: `minimal-ui`,
                    icon: `static/assets/gatsby-icon.png`
                }
            },
            `gatsby-plugin-offline`
        ].filter(Boolean)
    };
};
