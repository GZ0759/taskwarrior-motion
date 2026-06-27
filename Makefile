.PHONY: all install build dev test clean help

# 默认目标
all: build

# 安装依赖
install:
	@echo "Installing dependencies..."
	cd server && cargo build
	cd client && pnpm install

# 构建项目
build: build-server build-client

# 构建 Rust 后端
build-server:
	@echo "Building Rust server..."
	cd server && cargo build --release

# 构建 Vue 前端
build-client:
	@echo "Building Vue client..."
	cd client && pnpm build

# 开发模式
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://127.0.0.1:3001"
	@echo "Frontend: http://127.0.0.1:3000"
	@make -j2 dev-server dev-client

# 启动后端开发服务器
dev-server:
	cd server && cargo run

# 启动前端开发服务器
dev-client:
	cd client && pnpm dev

# 运行测试
test: test-server test-client

# 运行后端测试
test-server:
	@echo "Running Rust tests..."
	cd server && cargo test

# 运行前端测试
test-client:
	@echo "Running Vue tests..."
	cd client && pnpm test

# 运行测试并生成覆盖率报告
test-coverage:
	@echo "Running tests with coverage..."
	cd server && cargo tarpaulin --out Html
	cd client && pnpm test:coverage

# 代码检查
lint: lint-server lint-client

# 检查后端代码
lint-server:
	@echo "Checking Rust code..."
	cd server && cargo fmt --check
	cd server && cargo clippy -- -D warnings

# 检查前端代码
lint-client:
	@echo "Checking Vue code..."
	cd client && pnpm lint

# 格式化代码
fmt: fmt-server fmt-client

# 格式化后端代码
fmt-server:
	@echo "Formatting Rust code..."
	cd server && cargo fmt

# 格式化前端代码
fmt-client:
	@echo "Formatting Vue code..."
	cd client && pnpm format

# 清理构建文件
clean: clean-server clean-client

# 清理后端构建文件
clean-server:
	@echo "Cleaning Rust build..."
	cd server && cargo clean

# 清理前端构建文件
clean-client:
	@echo "Cleaning Vue build..."
	cd client && rm -rf node_modules dist .vite

# 运行 Storybook
storybook:
	@echo "Starting Storybook..."
	cd client && pnpm storybook

# 构建 Storybook
build-storybook:
	@echo "Building Storybook..."
	cd client && pnpm build-storybook

# 生成 API 文档
docs:
	@echo "Generating API documentation..."
	@echo "API documentation is in docs/specs/api-spec.md"

# 运行生产版本
run: build
	@echo "Starting production server..."
	@echo "Server running on http://127.0.0.1:5050"
	cd server && ./target/release/taskwarrior-motion

# 帮助信息
help:
	@echo "Available targets:"
	@echo "  all           - Build everything (default)"
	@echo "  install       - Install dependencies"
	@echo "  build         - Build server and client"
	@echo "  dev           - Start development servers"
	@echo "  test          - Run all tests"
	@echo "  test-coverage - Run tests with coverage"
	@echo "  lint          - Check code quality"
	@echo "  fmt           - Format code"
	@echo "  clean         - Clean build files"
	@echo "  storybook     - Start Storybook"
	@echo "  run           - Run production version"
	@echo "  help          - Show this help"
