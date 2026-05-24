FROM rust:1.85-slim AS builder
RUN apt-get update && apt-get install -y pkg-config libssl-dev

WORKDIR /app
COPY . .

RUN cargo build --release

FROM rust:1.85-slim

RUN apt-get update && apt-get install -y libssl3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/backend .
EXPOSE 8000
CMD [ "./backend" ]
