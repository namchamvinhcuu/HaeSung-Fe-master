import React from 'react'

export default function Menu2({ text, funcTest }) {

    const handleClick = () => {

        funcTest("1234");
    }
    return (
        <>
            <button onClick={handleClick}>Click redux</button>
        </>

    )
}
