export function errorHandler(err, req, res) {
    console.error(err);

    const status = err.statusCode ?? 500;
    const message = err.message ?? "Internal Server Error";

    res.status(status).json({ error: message });
}
