<?php
// Lightweight diagnostic endpoint to test POST handling
$logfile = __DIR__ . '/post_debug.log';
$entry = date('Y-m-d H:i:s') . " - METHOD=" . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN') . "\n";
$entry .= "HEADERS:\n" . print_r(getallheaders(), true) . "\n";
$entry .= "BODY:\n" . file_get_contents('php://input') . "\n\n";
file_put_contents($logfile, $entry, FILE_APPEND);
header('Content-Type: application/json');
echo json_encode([
    'ok' => true,
    'method' => $_SERVER['REQUEST_METHOD'] ?? null,
    'message' => 'Received (and logged) request at server'
]);
