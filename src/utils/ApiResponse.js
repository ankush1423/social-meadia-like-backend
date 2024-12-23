class ApiResponse {
    constructor(data, message = "Success"){
        this.data = data
        this.message = message
    }
}

export { ApiResponse }