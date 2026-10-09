import unittest
import json
import io
from app import app

class FlaskEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    def test_01_login_admin(self):
        res = self.client.post("/api/login", json={
            "email": "admin@edabip.com",
            "password": "password123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "admin")
        FlaskEndpointTests.admin_token = data["token"]
        print("PASS: Admin login")

    def test_02_login_viewer(self):
        res = self.client.post("/api/login", json={
            "email": "viewer@edabip.com",
            "password": "password123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        FlaskEndpointTests.viewer_token = data["token"]
        print("PASS: Viewer login")

    def test_03_get_me(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/me", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["email"], "admin@edabip.com")
        print("PASS: GET /api/me")

    def test_04_get_kpis(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/kpis", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("total_value", data)
        self.assertIn("total_records", data)
        self.assertIn("top_department", data)
        print("PASS: GET /api/kpis ->", data)

    def test_05_get_trend(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/metrics/trend", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        print(f"PASS: GET /api/metrics/trend returned {len(data)} month buckets")

    def test_06_get_by_department(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/metrics/by-department", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        print(f"PASS: GET /api/metrics/by-department returned {len(data)} depts")

    def test_07_get_top(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/metrics/top", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        print(f"PASS: GET /api/metrics/top returned {len(data)} items")

    def test_08_get_metrics_paginated(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/metrics?page=1&limit=10", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("data", data)
        self.assertEqual(len(data["data"]), 10)
        self.assertGreater(data["total"], 200)
        print(f"PASS: GET /api/metrics paginated (total: {data['total']})")

    def test_09_add_metric(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        payload = {
            "department": "Sales",
            "metric_name": "Test Postman Metric",
            "metric_value": 45000.50,
            "recorded_on": "2026-10-01"
        }
        res = self.client.post("/api/metrics", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        FlaskEndpointTests.created_metric_id = data["id"]
        print("PASS: POST /api/metrics -> ID", data["id"])

    def test_10_upload_csv(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        csv_data = (
            "department,metric_name,metric_value,recorded_on\n"
            "Finance,Audit Expense,12500.00,2026-09-15\n"
            "HR,Recruiting Budget,8400.00,2026-09-20\n"
        )
        data = {
            "file": (io.BytesIO(csv_data.encode("utf-8")), "test_upload.csv")
        }
        res = self.client.post("/api/metrics/upload", data=data, content_type="multipart/form-data", headers=headers)
        self.assertEqual(res.status_code, 201)
        resp_data = res.get_json()
        self.assertEqual(resp_data["inserted"], 2)
        print("PASS: POST /api/metrics/upload ->", resp_data["message"])

    def test_11_activity_log(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.get("/api/activity", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(len(data), 0)
        print(f"PASS: GET /api/activity returned {len(data)} actions")

    def test_12_role_protection_viewer_forbidden(self):
        headers = {"Authorization": f"Bearer {self.viewer_token}"}
        res = self.client.post("/api/metrics", json={
            "department": "Sales",
            "metric_name": "Viewer Try",
            "metric_value": 100,
            "recorded_on": "2026-10-01"
        }, headers=headers)
        self.assertEqual(res.status_code, 403)
        print("PASS: Role check — Viewer forbidden (403) from creating metrics")

    def test_13_delete_metric(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        res = self.client.delete(f"/api/metrics/{self.created_metric_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        print(f"PASS: DELETE /api/metrics/{self.created_metric_id}")

if __name__ == "__main__":
    unittest.main()
