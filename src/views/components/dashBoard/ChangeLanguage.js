import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';

function ChangeLanguage(props) {
    const { language, changeLanguage } = props;
    const [flag, setFlag] = useState('flag-icon-vi')

    useEffect(() => {
        if (language === "EN") {
            setFlag('flag-icon-us')
        }
        else {
            setFlag('flag-icon-vi')
        }
    }, [language])
    return (
        <li className="nav-item dropdown">
            <span className="nav-link" data-toggle="dropdown">
                <i className={`flag-icon ${flag}`}></i>
            </span>
            <div className="dropdown-menu dropdown-menu-right p-0">
                <span
                    // href="#"
                    className={`dropdown-item ${language == "EN" ? "active" : ""}`}
                    onClick={e => changeLanguage('EN')}
                >
                    <i className="flag-icon flag-icon-us mr-2"></i> English
                </span>
                <span
                    // href="#"
                    className={`dropdown-item ${language == "VI" ? "active" : ""}`}
                    onClick={e => changeLanguage('VI')}
                >
                    <i className="flag-icon flag-icon-vi mr-2"></i> Tiếng Việt
                </span>

            </div>
        </li>
    )
}

export default ChangeLanguage