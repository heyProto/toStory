import React from 'react'
import { renderToString } from 'react-dom/server'
import StoryCard from './src/js/Container.jsx'

global.window = {}

function render(mode, initialState) {
    let content = renderToString(
        <StoryCard
            dataJSON={initialState.dataJSON}
            mode={mode}
            renderingSSR={true}
        />
    );

    return { content, initialState };
}

module.exports = {
    render: render
}