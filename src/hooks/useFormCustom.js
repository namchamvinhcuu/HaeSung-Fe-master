import React, { useState } from 'react'

const useFormCustom = (initialModel) => {

    const [values, setValues] = useState({ ...initialModel });

    const handleInputChange = e => {
        const { name, value } = e.target;
        setValues(values => ({
            ...values,
            [name]: value
        }));
    }

    return {
        values,
        setValues,
        handleInputChange,
    }
}

export default useFormCustom;
