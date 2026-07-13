<?php
namespace App\Core;

class Response {
    public static function json($data, $status = 200, $headers = []) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        
        // CORS headers
        header('Access-Control-Allow-Origin: http://localhost:4200');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        
        foreach ($headers as $key => $value) {
            header("$key: $value");
        }
        
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public static function error($message, $status = 400, $code = null) {
        $response = [
            'success' => false,
            'error' => [
                'message' => $message,
                'code' => $code,
                'status' => $status
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ];
        self::json($response, $status);
    }

    public static function success($data = null, $message = null, $status = 200) {
        $response = [
            'success' => true,
            'data' => $data,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        self::json($response, $status);
    }
}