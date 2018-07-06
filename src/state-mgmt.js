

export class StateTracker {
    constructor() {
        this.track = []
    }
    
    addTracker(cb) {
        this.track.push(cb)
    }
    
    change() {
        this.track.forEach((cb) => cb())
    }
    
}
