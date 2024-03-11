import winston from "winston";

const logger = winston.createLogger({
  level: "info", // 로그 레벨을 'info'로 설정합니다.
  format: winston.format.json(), // 로그 포맷을 JSON 형식으로 설정합니다.
  transports: [
    new winston.transports.Console(), // 로그를 콘솔에 출력합니다.
  ],
});

export default function (req, res, next) {
  const start = new Date().getTime();

  // 응답 완료 시 로그를 기록
  function logRequest() {
    const duration = new Date().getTime() - start;
    logger.info(`Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration: ${duration}ms`);
  }

  // 응답 완료 시 로그를 기록
  res.on("finish", logRequest);

  // 요청이 닫혔을 때(실패 등)도 로그를 기록
  res.on("close", logRequest);

  next();
}
