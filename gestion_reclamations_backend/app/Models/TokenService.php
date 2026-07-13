<?php
namespace App\Models;

use App\Core\Response;

class TokenService {
    private $secret;
    private $expMinutes;

    public function __construct() {
        $config = require __DIR__ . '/../../config/config.php';
        $this->secret = $config['security']['token_secret'];
        $this->expMinutes = $config['security']['token_exp_minutes'];
    }

    public function generate($payload) {
        $payload['exp'] = time() + ($this->expMinutes * 60);
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64Header = $this->base64UrlEncode($header);
        $base64Payload = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->secret, true);
        $base64Signature = $this->base64UrlEncode($signature);
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    public function verify($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($base64Header, $base64Payload, $base64Signature) = $parts;
        
        $signature = $this->base64UrlDecode($base64Signature);
        $expectedSignature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->secret, true);
        
        if (!hash_equals($expectedSignature, $signature)) {
            return false;
        }
        
        $payload = json_decode($this->base64UrlDecode($base64Payload), true);
        
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }

    private function base64UrlEncode($data) {
        if (is_string($data)) {
            $data = base64_encode($data);
        } else {
            $data = base64_encode(json_encode($data));
        }
        return str_replace(['+', '/', '='], ['-', '_', ''], $data);
    }

    private function base64UrlDecode($data) {
        $data = str_replace(['-', '_'], ['+', '/'], $data);
        $mod4 = strlen($data) % 4;
        if ($mod4) {
            $data .= substr('====', $mod4);
        }
        return base64_decode($data);
    }
}