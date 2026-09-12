// dprevived event function

export default function sendEvent(action,data) {
    let event = new CustomEvent("dprevived",{detail:{'action':action,'data':data}});
    document.querySelector("body").dispatchEvent(event);
}
