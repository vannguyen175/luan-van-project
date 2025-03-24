import classNames from "classnames/bind";
import style from "./UploadImage.module.scss";
import { useRef, useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import { toast } from "react-toastify";
import { getBase64 } from "../../utils";

const cx = classNames.bind(style);

function UploadImage({ imageList, setImageList }) {
	const [images, setImages] = useState(imageList || []);
	const fileInputRef = useRef();

	const selectFiles = () => {
		fileInputRef.current.click();
	};

	const onFileSelect = (event) => {
		const files = event.target.files;
		if (files.length > 6) {
			toast.error("Số lượng ảnh không được vượt quá 6!");
			return;
		}
		if (files.length === 0) return;
		for (let i = 0; i < files.length; i++) {
			if (files[i].type.split("/")[0] !== "image") continue;
			if (!images.some((e) => e.name === files[i].name)) {
				setImages((prevImages) => [
					...prevImages,
					{
						name: files[i].name,
						url: URL.createObjectURL(files[i]),
					},
				]);
				getBase64(files[i])
					.then((result) => {
						setImageList((prevData) => [
							...prevData,
							{
								name: files[i].name,
								url: URL.createObjectURL(files[i]),
								result: result,
							},
						]);
					})
					.catch((error) => {
						console.error("Error:", error);
					});
			}
		}
	};

	const deleteImage = (index) => {
		setImages((prevImages) => prevImages.filter((_, i) => i !== index));
		setImageList((prevImages) => prevImages.filter((_, i) => i !== index));
	};

	return (
		<div className={cx("container")}>
			{images.length < 6 && (
				<div className={cx("drag-area")}>
					<input
						name="file"
						type="file"
						//multiple
						ref={fileInputRef}
						onChange={onFileSelect}
					/>
					<button onClick={selectFiles}>Thêm hình ảnh {images.length}/6</button>
				</div>
			)}
			<div className={cx("preview")}>
				{images.map((image, index) => (
					<div className={cx("image")} key={index}>
						<span
							className={cx("delete")}
							onClick={() => {
								deleteImage(index);
							}}
						>
							<CancelIcon />
						</span>
						<img src={image.url} alt={image.name} />
					</div>
				))}
			</div>
		</div>
	);
}

export default UploadImage;
