
import React, { Component } from 'react';

class Footer_DashBoard extends Component {

    render() {
        return (<footer className="main-footer " style={{ height: '45px' }}>
            <div className="float-right d-none d-sm-block">
                <b>Version</b> 1.0.0
            </div>
            <strong>Copyright &copy; 2022 <a href="#">HANLIM</a></strong>.
        </footer>
        );
    }
}

export default Footer_DashBoard;