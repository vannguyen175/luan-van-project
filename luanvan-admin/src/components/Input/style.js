import { AutoComplete } from "antd";
import styled from "styled-components";

export const AutoCompleteWrapper = styled(AutoComplete)`
	&.ant-select {
		.ant-select-selector {
			border: none;
			&:hover {
				border: none;
			}
		}
	}
`;
