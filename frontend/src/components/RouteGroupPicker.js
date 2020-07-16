import React from 'react';
import "./RouteGroupPicker.css";

class RouteGroupPicker extends React.Component {
    constructor() {
        super()
        this.state = {
            title: "Route Group",
            routes: []
        }
    }

    render() {
        this.routeGroupList = this.state.routes.map((routeGroup, key) => 
            <li id="route-group-{routeGroup.code}" key={key}><a href="#">{routeGroup.name}</a></li>
        )
        return (
            <div className="RouteGroupPicker">
                <h1>{this.state.title}</h1>
                <ul>
                {this.routeGroupList}
                </ul>

            </div>
        )
    }

    makeGetRequest() {
        return fetch('/api/routes/groups')
            .then(response => response.json())
            .then(response => response.routeCodes)
    }

    async componentDidMount() {
        try {
            let routeGroupListResult = await this.makeGetRequest();
            this.setState({
                routes: routeGroupListResult
            })
        } catch (e) {
            console.error(e)
        }
    }
}

export default RouteGroupPicker;
