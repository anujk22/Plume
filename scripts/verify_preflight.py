"""Verify archived file integrity and the two inspected raster grid relationships.

Requires rasterio, numpy, and pyproj. This validates preflight observations, not
facility attribution, cross-provider lineage, or production release readiness.
"""

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import rasterio
from pyproj import Transformer
from rasterio.warp import Resampling, reproject


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "directory", type=Path, nargs="?",
    default=Path(__file__).resolve().parents[1] / "evidence/preflight-2026-09-19",
)
args = parser.parse_args()
manifest = json.loads((args.directory / "manifest.json").read_text())
for item in manifest["files"]:
    data = (args.directory / item["path"]).read_bytes()
    assert len(data) == item["bytes"], item["path"]
    assert hashlib.sha256(data).hexdigest() == item["stored_sha256"], item["path"]

results = []
for name in ["emi20240420t101448p07050-A", "emi20241023t083741p06026-A"]:
    record = json.loads((args.directory / f"{name}.json").read_text())["items"][0]
    with rasterio.open(args.directory / f"{name}_plume-concentrations.tif") as visual:
        with rasterio.open(args.directory / f"{name}_con_tif.tif") as crop:
            assert visual.crs.to_epsg() == crop.crs.to_epsg() == 32638
            assert np.isnan(visual.nodata) and crop.nodata == 0
            concentrations = visual.read(1, masked=True)
            quantification = crop.read(1, masked=True)
            aligned = np.full(quantification.shape, np.nan, dtype="float32")
            reproject(
                visual.read(1), aligned,
                src_transform=visual.transform, src_crs=visual.crs,
                src_nodata=visual.nodata,
                dst_transform=crop.transform, dst_crs=crop.crs,
                dst_nodata=np.nan, resampling=Resampling.nearest,
            )
            valid = ~np.ma.getmaskarray(quantification)
            assert np.isfinite(aligned[valid]).all(), name
            np.testing.assert_array_equal(aligned[valid], quantification.data[valid])
            x, y = Transformer.from_crs(4326, visual.crs, always_xy=True).transform(
                *record["geometry_json"]["coordinates"]
            )
            assert visual.bounds.left <= x <= visual.bounds.right
            assert visual.bounds.bottom <= y <= visual.bounds.top
            results.append({
                "record": name,
                "matching_crop_samples": int(valid.sum()),
                "valid_visualization_zero_samples": int((concentrations.compressed() == 0).sum()),
                "provider_point_within_bounds": True,
            })
print(json.dumps({"verified_file_hashes": len(manifest["files"]), "rasters": results}, indent=2))
