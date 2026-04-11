---
title: Data Schema
description: Complete data schema specification for all content types.
---

All data types used in the minimal directory template. These schemas match the full Next.js template's `.content/` format.

## Item Schema

Source: `.content/data/<slug>/<slug>.yml`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `description` | string | Yes | Short description |
| `source_url` | string | Yes | External link |
| `category` | string \| string[] | Yes | Category ID(s) |
| `tags` | string[] | Yes | Tag IDs |
| `updated_at` | string | Yes | ISO date |
| `status` | enum | Yes | draft/pending/approved/rejected |
| `featured` | boolean | No | Featured flag |
| `icon_url` | string | No | Icon/logo URL |
| `collections` | string[] | No | Collection slugs |
| `markdown` | string | No | Rich content |

Derived fields: `id` and `slug` from directory name. Only `approved` items shown.

## Category Schema

Source: `.content/categories.yml`

| Field | Type | Required |
|-------|------|----------|
| `id` | string | Yes |
| `name` | string | Yes |
| `icon_url` | string | No |

## Tag Schema

Source: `.content/tags.yml`

| Field | Type | Required |
|-------|------|----------|
| `id` | string | Yes |
| `name` | string | Yes |
| `isActive` | boolean | No |

## Collection Schema

Source: `.content/collections.yml`

| Field | Type | Required |
|-------|------|----------|
| `id` | string | Yes |
| `slug` | string | Yes |
| `name` | string | Yes |
| `description` | string | Yes |
| `icon_url` | string | No |
| `items` | string[] | No |
| `isActive` | boolean | No |

## Site Config Schema

Source: `.content/config.yml`

| Field | Type | Required |
|-------|------|----------|
| `company_name` | string | Yes |
| `item_name` | string | Yes |
| `items_name` | string | Yes |
| `copyright_year` | number | Yes |
| `app_url` | string | No |
| `logo` | object | No |
| `pagination` | object | No |
| `settings` | object | No |
