import React, { memo } from 'react'

import { Handle } from 'react-flow-renderer'

export default memo(({ data: { rule } = {} }) => {
  return (
    <div className="border-4 border-yellow-500 bg-gray-200 rounded-xl">
      <Handle
        type="target"
        position="left"
        style={{ background: 'orange' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      ></Handle>
      <div className="mx-auto text-center">
        <div className="w-full bg-yellow-500 py-2 text-white">
          <div className="mb-1">Event Rule</div>
        </div>
        <div className="p-4">
          <svg class="w-10 h-10 mx-auto inline-block rounded-lg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="Arch_AWS-Lambda_32_svg__a">
                <stop stop-color="#C8511B" offset="0%"></stop>
                <stop stop-color="#F90" offset="100%"></stop>
              </linearGradient>
            </defs>
            <g fill="none" fill-rule="evenodd">
              <path d="M0 0h40v40H0z" fill="url(#Arch_AWS-Lambda_32_svg__a)"></path>
              <path
                d="M14.386 33H8.27l6.763-14.426 3.064 6.44L14.387 33zm1.085-15.798a.49.49 0 00-.442-.282h-.002a.493.493 0 00-.441.285l-7.538 16.08a.507.507 0 00.028.482c.09.145.247.233.415.233h7.206c.19 0 .363-.111.445-.286l3.944-8.489a.508.508 0 00-.002-.432l-3.613-7.591zM32.018 33h-5.882l-9.47-20.711a.491.491 0 00-.444-.289H12.37l.005-5h7.549l9.424 20.71c.08.177.256.29.446.29h2.224v5zm.49-6h-2.4L20.684 6.29a.492.492 0 00-.446-.29h-8.353a.496.496 0 00-.491.5l-.006 6c0 .132.052.259.144.354a.488.488 0 00.347.146h4.032l9.468 20.711c.08.176.254.289.445.289h6.686a.495.495 0 00.491-.5v-6c0-.276-.219-.5-.491-.5z"
                fill="#FFF"
              ></path>
            </g>
          </svg>
          <div className="text-xs inline-block pl-2 pr-6">{rule}</div>
        </div>
      </div>
    </div>
  )
})
