import React from 'react';
import { Form } from 'antd';
import FormContent from './FormContent';

@Form.create()
class KeyFormWithForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { Ref } = props;
    if (Ref) {
      Ref(this);
    }
  }

  getValues = () => {
    const {
      form: { validateFields },
    } = this.props;
    let formData = null;
    validateFields((err, values) => {
      if (!err) {
        formData = values;
      }
    });
    return formData;
  };

  render() {
    return (
      <Form>
        <FormContent {...this.props} />
      </Form>
    );
  }
}

const EncryptionKeyForm = (props = {}) => {
  const { form } = props;
  if (form) {
    return <FormContent {...props} />;
  }
  return <KeyFormWithForm {...props} />;
};
export default EncryptionKeyForm;
