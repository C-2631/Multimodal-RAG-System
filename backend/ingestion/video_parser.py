import os
import cv2
from typing import List, Dict, Any, Tuple
from backend.storage.object_store import object_store
from backend.ingestion.caption_generator import caption_generator
from backend.utils.logger import logger

class VideoParser:
    """Extracts visual keyframes and metadata from video files (mp4, webm, mkv, avi)."""

    def __init__(self, sample_rate_seconds: int = 3):
        self.sample_rate_seconds = sample_rate_seconds

    def parse(self, video_path: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Extract keyframes and timestamps from a video.
        Returns:
            frames_meta: list of dicts [{'page_number': int, 'image_path': str, 'image_url': str, 'caption': str, 'width': int, 'height': int, 'timestamp': str}]
            text_transcripts: list of speech chunks (if audio extracted)
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_interval = int(fps * self.sample_rate_seconds)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logger.info(f"Parsing video '{video_path}': fps={fps:.1f}, total_frames={total_frames}, sampling every {self.sample_rate_seconds}s")

        extracted_frames = []
        frame_idx = 0
        saved_idx = 1

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_interval == 0:
                seconds = int(frame_idx / fps)
                mins, secs = divmod(seconds, 60)
                timestamp_str = f"{mins:02d}:{secs:02d}"

                # Encode frame to PNG bytes
                success, buffer = cv2.imencode(".png", frame)
                if success:
                    img_bytes = buffer.tobytes()
                    img_path, img_url = object_store.save_image(img_bytes, ext=".png")

                    # Generate caption with timestamp
                    context = f"Video keyframe at timestamp {timestamp_str} from {os.path.basename(video_path)}"
                    caption = caption_generator.generate_caption(
                        image_path=img_path,
                        context=context
                    )

                    height, width = frame.shape[:2]
                    extracted_frames.append({
                        "page_number": saved_idx,
                        "image_path": img_path,
                        "image_url": img_url,
                        "caption": f"[{timestamp_str}] {caption}",
                        "width": width,
                        "height": height,
                        "timestamp": timestamp_str
                    })
                    saved_idx += 1

            frame_idx += 1

        cap.release()
        logger.info(f"Finished extracting {len(extracted_frames)} keyframes from video.")

        # Create virtual text chunks representing video timeline
        timeline_chunks = []
        for f in extracted_frames:
            timeline_chunks.append({
                "page_number": f["page_number"],
                "text": f"Video Scene at [{f['timestamp']}]: {f['caption']}"
            })

        return timeline_chunks, extracted_frames

video_parser = VideoParser()
