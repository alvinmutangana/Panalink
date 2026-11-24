# PanaLink

**Closer markets. Greater opportunities.**

PanaLink is a multi-vendor online marketplace that connects small rural sellers in Rwanda with buyers in towns and cities. It is built for slow connections and low-end phones, and works in Kinyarwanda, English and French.

- Live app: https://panalink.vercel.app
- SRS and system design: see the link in the submission document

## Features

**Buyers:** browse and search products (keyword, category, district, price range, and "can reach my district"), view product pages with up to 3 photos and seller ratings, message sellers, place orders, pay the seller directly by MTN Mobile Money or Airtel Money and submit the transaction ID, confirm delivery, rate the seller, and report problems.

**Sellers:** create an account, submit a national ID for verification, set mobile money payment details, publish, edit and delete products (up to 3 compressed photos each, with delivery options), accept or decline orders, confirm received payments, mark orders as sent, and see a business overview.

**Admins:** review seller verification requests, see all sellers, remove products that break the rules, resolve disputes between buyers and sellers, and see marketplace statistics.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, PostgreSQL (Neon in production), Drizzle ORM, Better Auth, Cloudflare R2 (images), Vercel (hosting).

## What you need before you start

- Node.js 20 or newer and npm
- Git
- PostgreSQL 14 or newer on your computer, or a free Neon account (https://neon.tech)
- A Cloudflare account with R2 enabled (for product photos)

## Setup, step by step

### 1. Get the code

```bash
git clone https://github.com/alvinmutangana/Panalink.git
cd Panalink
npm install
```

### 2. Create the database

With local PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE panalink;"
```

Your connection string will be `postgres://postgres:YOUR_PASSWORD@localhost:5432/panalink`.

With Neon: create a project, open **Connect**, and copy the connection string. Remove `&channel_binding=require` from the end.

### 3. Create the image bucket (Cloudflare R2)

1. In the Cloudflare dashboard, open **R2 Object Storage** and create a bucket named `panalink-images`.
2. Open the bucket, go to **Settings**, and enable the **Public Development URL**. Copy the URL (it looks like `https://pub-xxxx.r2.dev`).
3. In R2, open **Manage API Tokens** and create a token with **Object Read & Write** for that bucket. Copy the Access Key ID and the Secret Access Key. Your Account ID is on the R2 overview page.

### 4. Configure environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

| Variable | Value |
|---|---|
| `DATABASE_URL` | the connection string from step 2 |
| `BETTER_AUTH_SECRET` | a random secret: run `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `http://localhost:3000` (your site address in production) |
| `R2_ACCOUNT_ID` | your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | the R2 token access key |
| `R2_SECRET_ACCESS_KEY` | the R2 token secret |
| `R2_BUCKET` | `panalink-images` |
| `R2_PUBLIC_URL` | the public bucket URL, with no trailing slash |

### 5. Create the tables

```bash
npx drizzle-kit push
```

### 6. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

### 7. Create test accounts

1. Go to `/signup` and create a **seller** account (district: any district from the list).
2. Create a second account as a **buyer**.
3. Create a third account as a buyer, then make it an administrator:

```bash
psql -U postgres -d panalink -c "update \"user\" set role = 'admin' where lower(email) = lower('ADMIN_EMAIL');"
```

(With Neon, run the same SQL in the Neon SQL Editor.)

## How to try every feature

1. **Seller verification:** log in as the seller, open `/verify`, and submit any 16 digits (for example `1199880012345678`).
2. **Admin approval:** log in as the admin, open **Admin**, then **Verification requests**, and click **Approve**. The ID number is deleted after the decision.
3. **Publish products:** as the seller, open **Add a product**, add up to 3 photos, a price and a district.
4. **Browse and search:** as the buyer, use the search bar and the category, district and price filters.
5. **Messaging:** open a product and click **Message the seller**. Answer as the seller from **Messages**.
6. **Order flow:** as the seller, open **Payment details** and save a mobile money number. The buyer places an order and the seller accepts it. The buyer sends the amount to the seller's number, then enters a transaction ID (for example `MP2611250001`) and clicks **I have paid**. The seller clicks **I received the money**. Then the seller clicks **Mark as sent**, the buyer clicks **I received it** and rates the seller.

   6b. **Disputes:** on any paid order, click **Report a problem**. The admin resolves it under **Admin**, then **Disputes**.
7. **Moderation:** as the admin, open **Admin**, then **Products**, and remove a product.
8. **Languages:** switch RW, EN or FR in the header.

**Payments:** PanaLink does not process or hold money. After the seller accepts an order, the buyer sees the seller's MTN Mobile Money or Airtel Money number (or merchant code) and the exact amount, pays the seller directly outside the app, and submits the transaction ID from the confirmation message. The seller checks their mobile money messages and confirms receipt, and the order becomes Paid. A transaction ID can only be used once. This avoids payment gateway fees and approvals.

## Production build

```bash
npm run build
npm start
```

## Deploying (Vercel and Neon)

1. Create a Neon project and run `npx drizzle-kit push` against it (use its connection string as `DATABASE_URL` for that command).
2. Import the GitHub repository into Vercel and add the same environment variables as above, with `BETTER_AUTH_URL` set to your Vercel address.
3. Set the Vercel function region close to your database (Frankfurt for a Frankfurt Neon project).
4. Deploy.

## Project structure

```
app/            pages and server actions (listings, orders, messages, admin, auth)
components/     shared interface components (ui/ holds shadcn components)
db/             database schema (Drizzle)
lib/            authentication, queries, translations, payment methods
```

## Known limitations

* Mobile money payments are made directly between buyer and seller, and the seller confirms receipt manually. There is no automatic API integration with MTN or Airtel (a deliberate design decision to avoid gateway fees). The SRS lists API integration (NFR 8), so this is a documented deviation.
* Sign-up uses email (the SRS allows phone or email).
* There is no email or SMS notification system. Sellers see payment reports and new orders on their dashboard and orders page.