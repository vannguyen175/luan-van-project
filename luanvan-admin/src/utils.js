export const isJsonString = (data) => {
	try {
		JSON.parse(data);
	} catch (error) {
		return false;
	}
	return true;
};

export const getBase64 = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});

export const convertToSlug = (name) => {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ|Đ/g, "d")
		.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "");
};

export const StringTocamelCase = (str) => {
	// Using replace method with regEx
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ|Đ/g, "d")
		.replace(/\s(.)/g, function (a) {
			return a.toUpperCase();
		})
		.replace(/\s/g, "")
		.replace(/^(.)/, function (b) {
			return b.toLowerCase();
		});
};


