import { config } from 'gatsby-theme-docs';
import React, { useState } from 'react';
import SidebarTreeNode from './tree-node';

const calculateTreeData = edges => {
    const originalData = config.siteMetadata.sidebar.ignoreIndex
        ? edges.filter(
              ({
                  node: {
                      fields: { slug }
                  }
              }) => slug !== '/'
          )
        : edges;

    const tree = originalData.reduce(
        (
            accu,
            {
                node: {
                    fields: { slug, title }
                }
            }
        ) => {
            const parts = slug.split('/');
            let { items: prevItems } = accu;
            for (const part of parts.slice(1, -1)) {
                let tmp = prevItems.find(({ label }) => label === part);
                if (tmp) {
                    if (!tmp.items) {
                        tmp.items = [];
                    }
                } else {
                    tmp = { label: part, items: [] };
                    prevItems.push(tmp);
                }
                prevItems = tmp.items;
            }
            const existingItem = prevItems.find(
                ({ label }) => label === parts[parts.length - 1]
            );

            if (existingItem) {
                existingItem.url = slug;
                existingItem.title = title;
            } else {
                prevItems.push({
                    label: parts[parts.length - 1],
                    url: slug,
                    items: [],
                    title
                });
            }

            return accu;
        },
        { items: [] }
    );

    const {
        siteMetadata: {
            sidebar: { forcedNavOrder = [] }
        }
    } = config;

    const tmp = [...forcedNavOrder];

    tmp.reverse();

    return tmp.reduce((accu, slug) => {
        const parts = slug.split('/');
        let { items: prevItems } = accu;

        for (const part of parts.slice(1, -1)) {
            let tmp = prevItems.find(({ label }) => label === part);

            if (tmp) {
                if (!tmp.items) {
                    tmp.items = [];
                }
            } else {
                tmp = { label: part, items: [] };
                prevItems.push(tmp);
            }
            prevItems = tmp.items;
        }

        // sort items alphabetically.
        // eslint-disable-next-line array-callback-return
        prevItems.map(item => {
            item.items = item.items.sort(function(a, b) {
                if (a.label < b.label) return -1;
                if (a.label > b.label) return 1;
                return 0;
            });
        });
        const index = prevItems.findIndex(
            ({ label }) => label === parts[parts.length - 1]
        );
        accu.items.unshift(prevItems.splice(index, 1)[0]);
        return accu;
    }, tree);
};

export const SidebarTree = props => {
    const { edges } = props;
    const [treeData] = useState(() => {
        return calculateTreeData(edges);
    });
    const defaultCollapsed = {};
    treeData.items.forEach(item => {
        if (
            config.siteMetadata.sidebar.collapsedNav &&
            config.siteMetadata.sidebar.collapsedNav.includes(item.url)
        ) {
            defaultCollapsed[item.url] = true;
        } else {
            defaultCollapsed[item.url] = false;
        }
    });
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const toggle = url => {
        setCollapsed({
            ...collapsed,
            [url]: !collapsed[url]
        });
    };

    return (
        <SidebarTreeNode
            className={`${
                config.siteMetadata.sidebar.frontLine
                    ? 'showFrontLine'
                    : 'hideFrontLine'
            } firstLevel`}
            setCollapsed={toggle}
            collapsed={collapsed}
            {...treeData}
        />
    );
};

export default SidebarTree;
