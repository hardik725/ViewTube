class ApiResponse {
    constructor(statusCode,data,message="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

/*
Status code of the Api servers

generally
information data - 100-199
successful responses - 200-299
redirection messages - 300-399
client error response - 400-499
server error response - 500-599
*/