import BDV2 from "../modules/v2";

export default class BDLogo extends BDV2.reactComponent {
    render() {
        return BDV2.react.createElement(
            "svg",
            {height: "100%", width: this.props.size || "16px", className: "bd-logo " + this.props.className, style: {fillRule: "evenodd", clipRule: "evenodd", strokeLinecap: "round", strokeLinejoin: "round"}, viewBox: "0 0 2000 2000"},
            BDV2.react.createElement("metadata", null),
            BDV2.react.createElement("defs", null,
                BDV2.react.createElement("filter", {id: "shadow1"}, BDV2.react.createElement("feDropShadow", {"dx": "20", "dy": "0", "stdDeviation": "20", "flood-color": "rgba(0,0,0,0.35)"})),
                BDV2.react.createElement("filter", {id: "shadow2"}, BDV2.react.createElement("feDropShadow", {"dx": "15", "dy": "0", "stdDeviation": "20", "flood-color": "rgba(255,255,255,0.15)"})),
                BDV2.react.createElement("filter", {id: "shadow3"}, BDV2.react.createElement("feDropShadow", {"dx": "10", "dy": "0", "stdDeviation": "20", "flood-color": "rgba(0,0,0,0.35)"}))
            ),
            BDV2.react.createElement("g", null,
                BDV2.react.createElement("path", {style: {filter: "url(#shadow3)"}, d: "M1195.44+135.442L1195.44+135.442L997.6+136.442C1024.2+149.742+1170.34+163.542+1193.64+179.742C1264.34+228.842+1319.74+291.242+1358.24+365.042C1398.14+441.642+1419.74+530.642+1422.54+629.642L1422.54+630.842L1422.54+632.042C1422.54+773.142+1422.54+1228.14+1422.54+1369.14L1422.54+1370.34L1422.54+1371.54C1419.84+1470.54+1398.24+1559.54+1358.24+1636.14C1319.74+1709.94+1264.44+1772.34+1193.64+1821.44C1171.04+1837.14+1025.7+1850.54+1000+1863.54L1193.54+1864.54C1539.74+1866.44+1864.54+1693.34+1864.54+1296.64L1864.54+716.942C1866.44+312.442+1541.64+135.442+1195.44+135.442Z", fill: "#171717", opacity: "1"}),
                BDV2.react.createElement("path", {style: {filter: "url(#shadow2)"}, d: "M1695.54+631.442C1685.84+278.042+1409.34+135.442+1052.94+135.442L361.74+136.442L803.74+490.442L1060.74+490.442C1335.24+490.442+1335.24+835.342+1060.74+835.342L1060.74+1164.84C1150.22+1164.84+1210.53+1201.48+1241.68+1250.87C1306.07+1353+1245.76+1509.64+1060.74+1509.64L361.74+1863.54L1052.94+1864.54C1409.24+1864.54+1685.74+1721.94+1695.54+1368.54C1695.54+1205.94+1651.04+1084.44+1572.64+999.942C1651.04+915.542+1695.54+794.042+1695.54+631.442Z", fill: "#3E82E5", opacity: "1"}),
                BDV2.react.createElement("path", {style: {filter: "url(#shadow1)"}, d: "M1469.25+631.442C1459.55+278.042+1183.05+135.442+826.65+135.442L135.45+135.442L135.45+1004C135.45+1004+135.427+1255.21+355.626+1255.21C575.825+1255.21+575.848+1004+575.848+1004L577.45+490.442L834.45+490.442C1108.95+490.442+1108.95+835.342+834.45+835.342L664.65+835.342L664.65+1164.84L834.45+1164.84C923.932+1164.84+984.244+1201.48+1015.39+1250.87C1079.78+1353+1019.47+1509.64+834.45+1509.64L135.45+1509.64L135.45+1864.54L826.65+1864.54C1182.95+1864.54+1459.45+1721.94+1469.25+1368.54C1469.25+1205.94+1424.75+1084.44+1346.35+999.942C1424.75+915.542+1469.25+794.042+1469.25+631.442Z", fill: "#FFFFFF", opacity: "1"})
            )
        );
    }
}