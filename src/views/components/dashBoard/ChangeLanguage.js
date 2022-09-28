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
    }, [])
    return (
        <li className="nav-item dropdown">
            <a className="nav-link" data-toggle="dropdown" href="#">
                <i className={`flag-icon ${flag}`}></i>
            </a>
            <div className="dropdown-menu dropdown-menu-right p-0">
                <a
                    href="#"
                    className={`dropdown-item ${language == "EN" ? "active" : ""}`}
                    onClick={e => changeLanguage('EN')}
                >
                    <i className="flag-icon flag-icon-us mr-2"></i> English
                </a>
                <a
                    href="#"
                    className={`dropdown-item ${language == "VI" ? "active" : ""}`}
                    onClick={e => changeLanguage('VI')}
                >
                    <i className="flag-icon flag-icon-vi mr-2"></i> Tiếng Việt
                </a>

            </div>
        </li>
    )
}

export default ChangeLanguage