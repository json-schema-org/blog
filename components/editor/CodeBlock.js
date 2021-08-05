import { useState } from 'react'
import Highlight from 'react-syntax-highlighter'
import { solarizedDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

import IconClipboard from '../icons/Clipboard'
import Caption from '../Caption'

export default function CodeBlock({
  children,
  codeBlocks,
  className = '',
  highlightedLines,
  language = 'yaml',
  hasWindow = false,
  showCopy = true,
  showCaption = true,
  caption = '',
  showLineNumbers = true,
  startingLineNumber = 1,
  textSizeClassName = 'text-xs',
}) {
  const [activeBlock, setActiveBlock] = useState(0)
  const [showIsCopied, setShowIsCopied] = useState(false)
  codeBlocks = codeBlocks && codeBlocks.length ? codeBlocks : [{ code: children.replace(/\n$/, '') }]

  const tabItemsCommonClassNames = 'inline-block border-teal-300 py-1 px-2 mx-px cursor-pointer hover:text-teal-300'
  const tabItemsClassNames = `${tabItemsCommonClassNames} text-gray-300`
  const tabItemsActiveClassNames = `${tabItemsCommonClassNames} text-teal-300 font-bold border-b-2`

  function onClickCopy() {
    navigator.clipboard.writeText(codeBlocks[activeBlock].code).then(() => {
      setShowIsCopied(true)
      setTimeout(() => {
        setShowIsCopied(false)
      }, 2000)
    })
  }

  function renderHighlight() {
    return (
      <div>
        {codeBlocks.length > 1 && (
          <div className="text-xs pb-3 pt-0 pl-1">
            <nav>
              <ul>
                {
                  codeBlocks.map((block, index) => (
                    <li key={index} className={activeBlock === index ? tabItemsActiveClassNames : tabItemsClassNames} onClick={() => setActiveBlock(index)}>{block.language}</li>
                  ))
                }
              </ul>
            </nav>
          </div>
        )}
        <div className="pr-8 relative overflow-y-auto">
          <Highlight
            className={`pt-px pb-0 text-sm font-medium font-ligatures-contextual ${showLineNumbers ? 'ml-0' : 'ml-3'} ${textSizeClassName}`}
            language={language}
            style={solarizedDark}
            showLineNumbers={showLineNumbers}
            startingLineNumber={startingLineNumber}
            // lineProps={{
            //   className: 'pl-2 float-left left-0 sticky bg-code-editor-dark',
            //   style: {},
            // }}
            lineNumberStyle={lineNumber => {
              const isHighlighted = highlightedLines && highlightedLines.includes(lineNumber)
              return {
                className: `${isHighlighted ? 'bg-code-editor-dark-highlight text-gray-500' : 'text-gray-600'} block pl-2 pr-2`
              }
            }}
            lineProps={lineNumber => {
              const isHighlighted = highlightedLines && highlightedLines.includes(lineNumber)
              return {
                className: `${isHighlighted ? 'bg-code-editor-dark-highlight block ml-10 w-full' : ''} pr-8`,
              }
            }}
            codeTagProps={{
              className: 'mr-8'
            }}
          >
            {codeBlocks[activeBlock].code}
          </Highlight>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`${className} relative max-w-full rounded overflow-y-hidden overflow-x-auto py-2 bg-code-editor-dark z-10`}>
        {hasWindow && (
          <div className="pl-4 pb-2">
            <span className="inline-block rounded-full w-2.5 h-2.5 bg-mac-window-close mr-2"></span>
            <span className="inline-block rounded-full w-2.5 h-2.5 bg-mac-window-minimize mr-2"></span>
            <span className="inline-block rounded-full w-2.5 h-2.5 bg-mac-window-maximize mr-2"></span>
          </div>
        )}
        {
          showCopy && (
            <div className={`${ !showLineNumbers && codeBlocks[activeBlock].code.split('/n').length < 2 ? 'absolute top-0 bottom-0 right-0 pl-5 pr-2 bg-code-editor-dark' : ''} z-10`}>
              <button onClick={onClickCopy} className="absolute bg-code-editor-dark z-50 text-xs text-gray-500 right-2 top-1 cursor-pointer hover:text-gray-300 focus:outline-none" title="Copy to clipboard">
                {showIsCopied && <span className="inline-block pl-2 pt-1 mr-2">Copied!</span>}
                <span className="inline-block pt-1"><IconClipboard className="inline-block w-4 h-4 -mt-0.5" /></span>
              </button>
            </div>
          )
        }
        {renderHighlight()}
      </div>
      { showCaption && caption && (
        <Caption>{caption}</Caption>
      )}
    </>
  )
}

