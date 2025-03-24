import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBase64 } from "../../utils";
import { useApp } from "~/context/AppProvider";
import * as ProductService from "~/service/ProductService";
import Button from "~/components/Button";
import classNames from "classnames/bind";
import style from "./PostingProduct.module.scss";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import BasicInfo from "./BasicInfo";
import DetailInfo from "./DetailInfo";
import SellerInfo from "./SellerInfo";
import Result from "../../components/Result";
import LinearProgress from "@mui/material/LinearProgress";

const cx = classNames.bind(style);

const steps = [
	{ label: "Thông tin cơ bản", isNext: true },
	{ label: "Thông tin chi tiết", isNext: true },
	{ label: "Thông tin bán hàng", isNext: false },
];

function PostingProduct() {
	const { user } = useApp();
	const [activeStep, setActiveStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [isResult, setIsResult] = useState({
		type: "",
		message: "",
	});
	const [dataSubmit, setDataSubmit] = useState({
		idUser: user?.id,
		name: "",
		images: "",
		category: "",
		subCategory: "",
		stateProduct: "", //new, used
		info: {},
		price: null,
		description: "",
		quantity: "",
		address: {},
	});

	useEffect(() => {
		setDataSubmit((prevData) => ({
			...prevData,
			idUser: user.id,
			address: {
				province: user.province,
				district: user.district,
				ward: user.ward,
				address: user.address,
				phone: user.phone,
				email: user.email,
			},
		}));
	}, [user]);

	const nextStep = () => {
		setActiveStep(activeStep + 1);
	};

	const previousStep = () => {
		setActiveStep(activeStep - 1);
	};

	const handleSubmit = async () => {
		setLoading(true);
		const newImagesList = dataSubmit.images.map((image) => image.result);
		const data = {
			...dataSubmit,
			images: newImagesList,
			totalSold: user.totalSold, //sp đã bán trên 2 thì auto được duyệt
		};
		const res = await ProductService.createProduct(data);
		if (res.status === "SUCCESS") {
			setLoading(false);
			setIsResult({
				type: "success",
				message: res.message,
			});
		} else {
			setLoading(false);
			setIsResult({
				type: "error",
				message: res.message,
			});
		}
	};

	return (
		<div>
			{isResult.type !== "" ? (
				isResult.type == "success" ? (
					<Result
						type="success"
						message="Đăng tải sản phẩm thành công!"
						subMessage={
							"Bài đăng của bạn sẽ được quản trị viên kiểm duyệt trước khi đăng bán."
						}
						backBtn="/nha-ban-hang"
						stayBtn="."
					/>
				) : (
					<Result
						type="error"
						message="Đăng tải sản phẩm thất bại"
						subMessage={isResult.message}
						backBtn="/nha-ban-hang"
						stayBtn="."
					/>
				)
			) : (
				<div style={{ display: "flex", justifyContent: "center" }}>
					<div style={{ width: "70%" }}>
						<div className={cx("inner-content")}>
							<div className={cx("steps")}>
								{steps.map((item, index) => (
									<div key={index}>
										<button
											//onClick={() => setActiveStep(index)}
											className={cx(activeStep === index && "active-step")}
										>
											{item.label}
										</button>
										{item.isNext && (
											<NavigateNextIcon style={{ marginTop: 0 }} />
										)}
									</div>
								))}
							</div>
						</div>
						<div className={cx("inner-content")} style={{ paddingBottom: 40 }}>
							<p className="title">{steps[activeStep].label}</p>
							{activeStep === 0 && (
								<>
									<BasicInfo
										dataSubmit={dataSubmit}
										setDataSubmit={setDataSubmit}
									/>
									<div style={{ marginLeft: "80%", marginTop: 30 }}>
										<Button>Hủy</Button>
										{dataSubmit.name &&
										dataSubmit.images?.length > 0 &&
										dataSubmit.category &&
										dataSubmit.subCategory ? (
											<Button primary onClick={nextStep}>
												Tiếp theo
											</Button>
										) : (
											<Button disabled>Tiếp theo</Button>
										)}
									</div>
								</>
							)}
							{activeStep === 1 && (
								<>
									<DetailInfo
										dataSubmit={dataSubmit}
										setDataSubmit={setDataSubmit}
									/>
									<div style={{ marginLeft: "70%", marginTop: 20 }}>
										<Button>Hủy</Button>
										<Button onClick={previousStep}>Quay lại</Button>
										{dataSubmit.info &&
										dataSubmit.price > 0 &&
										dataSubmit.stateProduct ? (
											<Button primary onClick={nextStep}>
												Tiếp theo
											</Button>
										) : (
											<Button disabled>Tiếp theo</Button>
										)}
									</div>
								</>
							)}
							{activeStep === 2 && (
								<>
									<SellerInfo
										dataSubmit={dataSubmit}
										setDataSubmit={setDataSubmit}
									/>
									{loading ? (
										<LinearProgress />
									) : (
										<div style={{ marginLeft: "70%", marginTop: 20 }}>
											<Button>Hủy</Button>
											<Button onClick={previousStep}>Quay lại</Button>
											<Button primary onClick={handleSubmit}>
												Đăng tải
											</Button>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default PostingProduct;
