import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { mongoDbProvider } from './mongoDBProvider';
import { agentsRouter } from './routers/agentsRouter.router';
import { conversationsRouter } from './routers/conversationsRouter.router';
import { dataAggregationRouter } from './routers/dataAggregationRouter.router';
import { experimentsRouter } from './routers/experimentsRouter.router';
import { formsRouter } from './routers/formsRouter';
import { UserPush } from './models/UserPush';
import { usersRouter } from './routers/usersRouter.router';
import { usersService } from './services/users.service';
import './services/weatherNotifier';
import './services/weatherService';
import './services/newsNotifier';
import './services/newsService';

dotenv.config();

mongoDbProvider.initialize();

const createAdminUser = (username: string, password: string) => {
    if (!username || !password) {
        console.warn('Username and password are required');
        process.exit(1);
    }

    usersService
        .createAdminUser(username, password)
        .then(() => {
            console.log('Admin user created successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error creating admin user:', error);
            process.exit(1);
        });
};

    const setupServer = () => {
    const app = express();
    app.use(bodyParser.json());

    // ✅ 完整 CORS 配置
    const allowedOrigins = [
        process.env.FRONTEND_URL?.replace(/\/$/, '') || "https://lexi-jarvis.web.app",
        "http://localhost:3000",
        "https://6c191b622496.ngrok-free.app", // ✅ ngrok 域名
         "https://lexi-jarvis.web.app/project-overview"
    ];

    const corsOptions = {
        origin: function (origin: any, callback: any) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`❌ Blocked by CORS: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions)); // ✅ 处理 OPTIONS 预检请求
    app.use(cookieParser());

    const PORT = process.env.PORT || 5050;
    app.use('/health', (req, res) => res.status(200).send('OK'));
    app.use('/conversations', conversationsRouter());
    app.use('/experiments', experimentsRouter());
    app.use('/users', usersRouter());
    app.use('/agents', agentsRouter());
    app.use('/dataAggregation', dataAggregationRouter());
    app.use('/forms', formsRouter());

    app.post("/api/savePushInfo", async (req, res) => {
    const { userId, pushInfo } = req.body;
    if (!userId || !pushInfo) {
        return res.status(400).send("❌ 缺少参数 userId 或 pushInfo");
    }

    try {
        await UserPush.findOneAndUpdate(
            { userId },
            { pushInfo },
            { upsert: true, new: true }
        );
        res.send("✅ 已保存推送信息");
    } catch (err) {
        console.error("❌ 保存失败:", err);
        res.status(500).send("❌ 服务器错误");
    }
});

    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
    });
};

if (process.argv[2] === 'create-user') {
    const [, , , username, password] = process.argv;
    createAdminUser(username, password);
} else {
    setupServer();
}
