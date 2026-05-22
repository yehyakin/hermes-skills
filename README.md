This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying/using-the-cli) for more details.

---

## Menswear Workflow (AI 男装工作流)

### API Base
```
http://192.168.3.182:8787/api
```

### Key Endpoints

| Method | Path | 说明 |
|--------|------|------|
| POST | `/workflow/generate-outfit` | 创建试穿任务 |
| GET | `/workflow/monitor/{workflow_id}` | 轮询任务状态 |
| GET | `/workflow/asset/{asset_id}/lineage` | 查询资产血缘 |
| GET | `/assets/list?type_filter=model_image` | 列出素材 |

### Create Workflow Request

```json
POST /api/workflow/generate-outfit
{
  "project": "SUPERCOLOR_MENSWEAR_WORKFLOW",
  "workflow_mode": "single_outfit",
  "provider": "image2",
  "parent_assets": {
    "model_asset_id": "ASSET-XXXX-MODEL01",
    "garment_asset_ids": ["ASSET-XXXX-TOP01", "ASSET-XXXX-PANTS01"]
  },
  "idempotency_key": "stable-key",
  "billing_risk_level": "none",
  "payload": { "__test_result": "https://...", "result_type": "generated_tryon_image" }
}
```

### Routes
- `/` — Command Center Dashboard
- `/menswear` — Menswear AI Workflow UI
- `/tasks` — Task Management

